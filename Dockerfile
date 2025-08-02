FROM node:22
WORKDIR /app
ENV PUBLIC_PATH=./static

COPY ./backend/dist .
COPY ./backend/node_modules ./node_modules
COPY ./frontend/dist ./${PUBLIC_PATH}

USER 1000
EXPOSE 8080
CMD ["node", "main.js"]
