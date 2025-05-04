
FROM node:23-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat            


FROM base AS deps

COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/

RUN npm install                               

FROM deps AS build

COPY . .
RUN npm run build --workspace=@repo/types
RUN npm run build --workspace=apps/web


FROM node:23-alpine AS release

WORKDIR /app/apps/web
ENV NODE_ENV=production

COPY --from=build /app/apps/web/.next ./.next
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/web/package.json ./

EXPOSE 3000
CMD ["npm", "run", "start"]
