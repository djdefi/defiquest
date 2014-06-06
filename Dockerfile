#
# VERSION 0.0.1

FROM ubuntu:precise
MANTAINER Ryan Trauntvein <djdefi@gmail.com>

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2/

RUN apt-get update
RUN apt-get install -y git apache2
RUN rm -rf /var/www
ADD . /var/www

EXPOSE 80

CMD ["/usr/sbin/apache2", "-D", "FOREGROUND"] 
