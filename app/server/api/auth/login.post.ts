import z from 'zod';
import { sign } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'ユーザ名は必須です' }),
  password: z.string().min(1, { message: 'パスワードは必須です' }),
});

export default defineEventHandler(async (event) => {
  const result = loginSchema.safeParse(await readBody(event));
  if (!result.success) {
    throw createError({
      statusCode: 403,
      statusMessage: result.error.message,
    });
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      name: result.data.username,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 403,
      statusMessage: "ログインに失敗しました。",
    });
  }

  // bcryptを使用してパスワードを検証
  const isPasswordValid = await bcrypt.compare(result.data.password, user.password);
  
  if (!isPasswordValid) {
    throw createError({
      statusCode: 403,
      statusMessage: "ログインに失敗しました。",
    });
  }

  // ログイン成功時にlast_loginを更新
  await prisma.user.update({
    where: { id: user.id },
    data: { last_login: new Date() }
  });

  const expiresIn = 60 * 60 * 24 * 14; // 14日
  const tokenPayload = {
    name: result.data.username,
    id: user.id,
  };

  const config = useRuntimeConfig(event);
  const accessToken = sign(tokenPayload, config.jwtSecret, {
    expiresIn,
  });

  return {
    token: accessToken,
  };
});
