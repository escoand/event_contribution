FROM eclipse-mosquitto:2

RUN apk add --no-cache caddy

# deactivated for railway.com
#VOLUME /data
RUN mkdir /data && chown mosquitto /data

COPY Caddyfile mosquitto.conf /etc/
COPY dist/ /www/

EXPOSE 80

CMD ["sh", "-c", "mosquitto -c /etc/mosquitto.conf & caddy run -c /etc/Caddyfile"]