#!/bin/bash

echo "Atualizando o projeto no GitHub"

git status

git add .

git commit -m "Atualização para melhorias no projeto"

git push origin main

echo "Projeto atualizado com sucesso!"