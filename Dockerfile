FROM eclipse-mosquitto

COPY mosquitto.conf  /mosquitto/config/mosquitto.conf
COPY *.html css/ js/ /www/

RUN mkdir /data
VOLUME /data

EXPOSE 1883 9001

CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]