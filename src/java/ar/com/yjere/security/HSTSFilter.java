package ar.com.yjere.security;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author oocanto
 */
public class HSTSFilter implements Filter {

    int MAX_AGE = 31622400; // 366 días.

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest setvletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {

        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;

        // HTTP Strict Transport Security: se fuerza a que las comunicaciones
        // con el navegador sean HSTS, independientemente de si el request es
        // http o https...
        // Fuente: https://stackoverflow.com/questions/27541755/add-hsts-feature-to-tomcat
        //         https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security
        httpServletResponse.setHeader("Strict-Transport-Security", "max-age=" + this.MAX_AGE + "; includeSubDomains");

        chain.doFilter(setvletRequest, httpServletResponse);
    }

    @Override
    public void destroy() {
    }
}
