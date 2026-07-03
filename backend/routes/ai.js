import { Router } from 'express';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/coach', auth, async (req, res) => {
  try {
    const { exerciseName } = req.body;
    if (!exerciseName) {
      return res.status(400).json({ message: 'Exercise name required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenRouter API key not configured' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fittrack.app',
        'X-Title': 'FitTrack Calisthenics Coach',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert calisthenics coach. Provide clear, concise form guidance for bodyweight exercises. Keep responses under 200 words. Use plain text only — no markdown, no **, no ##, no --. Start each section with the section name on its own line (like Setup, Execution, Tips).',
          },
          {
            role: 'user',
            content: `Give me form guidance for the calisthenics/bodyweight exercise: ${exerciseName}. Focus ONLY on bodyweight form, no weights needed.`,
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] OpenRouter error:', data);
      return res.status(502).json({ message: data.error?.message || 'AI service error' });
    }

    const guidance = data.choices?.[0]?.message?.content || 'No guidance available.';

    const tips = [
      'Breathe steadily — exhale on the effort, inhale on the release',
      'Control the negative (lowering phase) for more muscle activation',
      'Rest 60-90 seconds between sets for strength, 30s for endurance',
      'Progress by adding reps, not weight — calisthenics is about mastery',
      'Film yourself to check your form',
      'Warm up with dynamic stretches before starting',
      'Practice daily for skill-based exercises like handstands',
    ];

    res.json({
      guidance,
      quickTip: tips[Math.floor(Math.random() * tips.length)],
      exerciseName,
    });
  } catch (err) {
    console.error('[AI] coach error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenRouter API key not configured' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fittrack.app',
        'X-Title': 'FitTrack AI Chat',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a calisthenics fitness coach. ONLY answer questions about bodyweight training, calisthenics exercises, nutrition, recovery, and workout programming. If the user asks about ANY topic outside of fitness, health, or exercise, politely refuse and redirect them to ask a fitness-related question. Do NOT answer questions about politics, programming, general knowledge, or any non-fitness topic. Keep answers practical and actionable. Max 250 words. Do NOT use markdown formatting like **, ##, or --.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 600,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] OpenRouter chat error:', data);
      return res.status(502).json({ message: data.error?.message || 'AI service error' });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response available.';

    res.json({
      reply,
      sources: ['OpenRouter AI (GPT-4o-mini)'],
    });
  } catch (err) {
    console.error('[AI] chat error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
