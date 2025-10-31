FROM node:22 as front_dependencies
COPY web/package.json web/package.json
COPY web/package-lock.json web/package-lock.json
RUN npm --prefix web ci

FROM python:3.14 as back_dependencies
RUN sudo apt install bluetooth bluez libbluetooth-dev
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt

FROM node:22 as front_build
COPY web/ web/
COPY --from web/node_modules/ web/node_modules/
RUN npm --prefix web run build

FROM python:3.14 as back_build
COPY . .
COPY --from front_build web/dist/ static/
COPY --from back_dependencies /usr/local/lib/python3.14/site-packages/ /usr/local/lib/python3.14/site-packages/
ENTRYPOINT ["python3", "manage.py", "runserver"]