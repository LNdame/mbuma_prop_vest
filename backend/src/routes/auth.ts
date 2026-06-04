import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { verifyPassword } from '../lib/password.js';
import { signJwt } from '../lib/jwt.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Returns: { token: string, user: { id, email, fullName, role } }
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account is inactive' });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const token = signJwt({ sub: user.id, email: user.email, role: user.role }, secret);

  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
});

/**
 * GET /api/auth/me  (requires Bearer token)
 */
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
