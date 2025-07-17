import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { validateMeetingData, rateLimiter } from '@/lib/validation';
import { logger } from '@/lib/logger';

// CSRF protection utility
function getCSRFToken(request: NextRequest): string | null {
  return request.headers.get('x-csrf-token') || 
         request.cookies.get('csrf-token')?.value || null;
}

function validateCSRF(request: NextRequest): boolean {
  const token = getCSRFToken(request);
  const sessionToken = request.cookies.get('session-csrf')?.value;
  
  // In production, implement proper CSRF validation
  // For now, just check that both tokens exist
  return !!(token && sessionToken);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    if (!rateLimiter.isAllowed(clientIP, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
        { status: 429 }
      );
    }

    // CSRF protection
    if (!validateCSRF(request)) {
      logger.error('CSRF validation failed', { ip: clientIP });
      return NextResponse.json(
        { error: 'Token de seguridad inválido' },
        { status: 403 }
      );
    }

    // Get user from Supabase
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateMeetingData(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Calculate total cost server-side for security
    const totalCost = (
      validation.sanitizedData.attendees_count * 
      validation.sanitizedData.average_hourly_rate * 
      validation.sanitizedData.duration_minutes
    ) / 60;

    // Insert into database
    const { data, error } = await supabase
      .from('meetings')
      .insert([{
        user_id: user.id,
        title: validation.sanitizedData.title,
        description: validation.sanitizedData.description,
        attendees_count: validation.sanitizedData.attendees_count,
        duration_minutes: validation.sanitizedData.duration_minutes,
        average_hourly_rate: validation.sanitizedData.average_hourly_rate,
        meeting_date: body.meeting_date || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Database error creating meeting', { 
        userId: user.id, 
        error: error.message 
      });
      return NextResponse.json(
        { error: 'Error al crear la reunión' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    logger.error('Unexpected error in meetings API', { error });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, description, attendees_count, duration_minutes, average_hourly_rate, total_cost, meeting_date, created_at')
      .eq('user_id', user.id)
      .order('meeting_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Database error fetching meetings', { 
        userId: user.id, 
        error: error.message 
      });
      return NextResponse.json(
        { error: 'Error al obtener las reuniones' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    logger.error('Unexpected error in meetings GET API', { error });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
