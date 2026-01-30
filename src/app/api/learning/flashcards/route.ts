import { NextRequest, NextResponse } from 'next/server'
import { getFlashcards, toggleFlashcardFlag } from '@/lib/flashcard'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dueOnly = searchParams.get('dueOnly') === 'true'
    const status = searchParams.get('status')
    const flaggedOnly = searchParams.get('flaggedOnly') === 'true'

    const cards = await getFlashcards(authUser.userId, {
      status: status || undefined,
      flaggedOnly,
      dueOnly,
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, flashcardId } = body

    if (action === 'flag') {
      const result = await toggleFlashcardFlag(flashcardId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
