import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, cookie } = await req.json()

    // Basic validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Create or update waitlist lead
    const lead = await prisma.waitlistLead.upsert({
      where: { email },
      update: {
        status: 'active', // Reactivate if they rejoin
        updatedAt: new Date(),
        cookie,
      },
      create: {
        email,
        source: 'landing_page',
        // status: 'active',
        cookie,
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Waitlist submission error:', error)
    
    // Check for unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email is already on the waitlist!' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}