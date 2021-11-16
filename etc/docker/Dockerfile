FROM python:3.7

ENV PYTHONUNBUFFERED 1
#RUN mkdir /code
WORKDIR /code
COPY . /code/
RUN pip install -r requirements.txt

CMD [ "gunicorn", "-c", "conf.py", "--bind", ":80", "--chdir", "/../../code","tic_tac_toe.wsgi:application" ]