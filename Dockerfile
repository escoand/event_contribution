FROM eclipse-mosquitto

COPY mosquitto.conf  /mosquitto/config/mosquitto.conf
COPY *.html /www/
COPY css/ /www/css/
COPY js/ /www/js/

VOLUME /data

EXPOSE 9001

CMD ["sh", "-c", "chown mosquitto /data && /usr/sbin/mosquitto -c /mosquitto/mosquitto/mosquitto.conf"]