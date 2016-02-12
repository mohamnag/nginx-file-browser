#nginx file browser
This web application is a very simple file browser which can be used
effectively together with [nginx's autoindex module](http://nginx.org/en/docs/http/ngx_http_autoindex_module.html).

A sample nginx configuration is also included.

Mainly for demonstration purposes a docker image is also available [here](https://hub.docker.com/r/mohamnag/nginx-file-browser/).
In order to use this docker image, the volume which has to be served should
be mounted under `/opt/www/files/` and port `80` of container shall be mapped
to a proper port on host. A proper run would look like:

```
$ docker run -p 8080:80 -v /path/to/my/files/:/opt/www/files/ mohamnag/nginx-file-browser
```