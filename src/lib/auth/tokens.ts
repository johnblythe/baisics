import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

interface TokenPayload {
  userId: string;
  email: string;
  type: 'stripe_return';
  expiresIn: string;
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  const token = await new SignJWT({
    ...payload,
    jti: nanoid(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresIn)
    .sign(secret);

  return token;
} 