# Use a base image with Node.js 16.13.2
FROM node:16.13.2

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Copia os arquivos necessários para o container
COPY rootfs /

RUN npm install

# Define o comando para iniciar a aplicação
CMD [ "npm", "start" ]