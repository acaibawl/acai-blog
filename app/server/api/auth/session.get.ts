import { verify } from 'jsonwebtoken';
import { H3Event } from 'h3';

const TOKEN_TYPE = "Bearer";

const extractToken = (authHeaderValue: string) => {
  const[, token] = authHeaderValue.split(`${TOKEN_TYPE} `);
  return token;
}

const ensureAuth = (event: H3Event) => {
  const authHeaderValue = getRequestHeader(event, "authorization");
  if (!authHeaderValue) {
    throw createError({
      statusCode: 403,
      statusMessage: "Need to pass valid Bearer-authorization header to access this endpoin",
    });
  }

  const extractedToken = extractToken(authHeaderValue);
  try {
    const config = useRuntimeConfig(event);
    return verify(extractedToken, config.jwtSecret);
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid Bearer-authorization header",
    })
  }
}

export default defineEventHandler(async (event) => {
  const data = ensureAuth(event);
  return data;
});
