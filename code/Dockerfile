FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .
#EXPOSE 8000

# Gunicorn
#CMD ["gunicorn", "--bind", ":8000", "tic_tac_toe.wsgi:application"]
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:80"]