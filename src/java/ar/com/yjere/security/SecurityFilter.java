package ar.com.yjere.security;

/*
import ar.com.yjere.umbral.Umbral;
import ar.com.yjere.umbral.exception.IllegalAccessAttemptException;
import ar.com.yjere.umbral.exception.NonConfiguredPermissionException;
import ar.com.yjere.umbral.exception.UmbralException;
*/
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Osvaldo
 */
public class SecurityFilter implements Filter {

    private final String URL_DEFAULT_SUFFIX = ".html";
    private final String RESPONSE_REDIRECT_LOGIN = "login.html";
    private String SECURITY_ISSUER = null;
    private String UMBRAL_GENERIC_MODEL = null;
    private String UMBRAL_GENERIC_USERNAME = null;
    private String PRODUCTION_ENVIRONMENT_DOMAIN = null;

    public void init(FilterConfig filterConfig) throws ServletException {

        this.SECURITY_ISSUER = filterConfig.getInitParameter("SECURITY_ISSUER");
        this.UMBRAL_GENERIC_MODEL = filterConfig.getInitParameter("UMBRAL_GENERIC_MODEL");
        this.UMBRAL_GENERIC_USERNAME = filterConfig.getInitParameter("UMBRAL_GENERIC_USERNAME");
        this.PRODUCTION_ENVIRONMENT_DOMAIN = filterConfig.getInitParameter("PRODUCTION_ENVIRONMENT_DOMAIN");
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        
        /*
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        boolean isProdEnv = false;

        if (httpServletRequest.getRequestURL().toString().toLowerCase().contains(this.PRODUCTION_ENVIRONMENT_DOMAIN)) {
            isProdEnv = true;
        }

        if (httpServletRequest.getRequestURL().toString().endsWith(this.URL_DEFAULT_SUFFIX)) {

            if (httpServletRequest.getRequestURL().toString().endsWith(this.RESPONSE_REDIRECT_LOGIN)) {

                if (httpServletRequest.getMethod().trim().toUpperCase().equals("POST")) {

                    Map<String, List<String>> headers = null;
                    Enumeration<String> headersEnum = null;
                    Enumeration<String> headerValuesEnum = null;
                    String name = null;
                    List<String> values = null;
                    String token = null;
                    Payload payload = null;
                    Cookie cookie = null;

                    headers = new HashMap<String, List<String>>();

                    headersEnum = httpServletRequest.getHeaderNames();

                    while (headersEnum.hasMoreElements()) {

                        name = headersEnum.nextElement();

                        headerValuesEnum = httpServletRequest.getHeaders(name);

                        values = new LinkedList<String>();

                        while (headerValuesEnum.hasMoreElements()) {

                            values.add(headerValuesEnum.nextElement());
                        }

                        headers.put(name, values);
                    }

                    token = JwtSecurity.getInstance().getToken(headers);

                    payload = JwtSecurity.getInstance().getPayload(token, this.SECURITY_ISSUER);

                    if (payload != null) {

                        cookie = new Cookie(this.SECURITY_ISSUER, token);
                        cookie.setMaxAge(Integer.MAX_VALUE);
                        httpServletResponse.addCookie(cookie);

                    }

                }

            } else {

                boolean isValid = false;

                // Por acá pasan todas las páginas comunes que no son el login de inicio de sesión...
                try {
                    // Si se debe ignorar la url, se la ignora sin verificar ningún permiso.
                    // No se verifica nada si está dentro de las URIs habilitadas a funcionar sin un
                    // token...
                    System.out.println("[DEBUG][UMBRAL][" + this.UMBRAL_GENERIC_MODEL + "][TRY1][" + httpServletRequest.getRequestURL() + "][Eval]");
                    Umbral.getInstance(this.UMBRAL_GENERIC_MODEL).performPermissionVerification(this.UMBRAL_GENERIC_USERNAME, httpServletRequest);

                    isValid = true;

                } catch (IllegalAccessAttemptException e) {
                    System.out.println("[DEBUG][UMBRAL][" + this.UMBRAL_GENERIC_MODEL + "][TRY1][" + httpServletRequest.getRequestURL() + "][IllegalAccessAttemptException: " + e.getMessage() + "]");
                    Logger.getLogger(SecurityFilter.class.getName()).log(Level.SEVERE, null, e);
                    ((HttpServletResponse) response).sendRedirect((isProdEnv ? "../../" : "") + this.RESPONSE_REDIRECT_LOGIN);
                } catch (NonConfiguredPermissionException e) {
                    System.out.println("[DEBUG][UMBRAL][" + this.UMBRAL_GENERIC_MODEL + "][TRY1][" + httpServletRequest.getRequestURL() + "][NonConfiguredPermissionException: " + e.getMessage() + "]");
                    // No se hace nada, porque de todos modos, más adelante va a caer sola la URI si
                    // no tiene token...
                    // e.printStackTrace();
                } catch (UmbralException e) {
                    System.out.println("[DEBUG][UMBRAL][" + this.UMBRAL_GENERIC_MODEL + "][TRY1][" + httpServletRequest.getRequestURL() + "][UmbralException: " + e.getMessage() + "]");
                    Logger.getLogger(SecurityFilter.class.getName()).log(Level.SEVERE, null, e);
                    ((HttpServletResponse) response).sendRedirect((isProdEnv ? "../../" : "") + this.RESPONSE_REDIRECT_LOGIN);
                }

                if (!isValid) {

                    Cookie[] cookies = null;
                    byte[] bytes = null;
                    Payload payload = null;

                    cookies = httpServletRequest.getCookies();

                    if (cookies != null && cookies.length > 0) {

                        for (int i = 0; i < cookies.length; i++) {

                            if (cookies[i].getName().equals(this.SECURITY_ISSUER)) {

                                payload = JwtSecurity.getInstance().getPayload(cookies[i].getValue(), this.SECURITY_ISSUER);

                                break;

                            }
                        }
                    }

                    if (payload != null) {

                        if (!payload.isAdmin()) {

                            try {
                                System.out.println("[DEBUG][UMBRAL][" + payload.getCompany() + "][TRY2][" + httpServletRequest.getRequestURL() + "][Eval]");
                                Umbral.getInstance(payload.getCompany()).performPermissionVerification(payload.getUsername(), httpServletRequest);
                            } catch (UmbralException e) {
                                System.out.println("[DEBUG][UMBRAL][" + payload.getCompany() + "][TRY2][" + httpServletRequest.getRequestURL() + "][UmbralException: " + e.getMessage() + "]");
                                Logger.getLogger(SecurityFilter.class.getName()).log(Level.SEVERE, null, e);
                                ((HttpServletResponse) response).sendRedirect((isProdEnv ? "../../" : "") + this.RESPONSE_REDIRECT_LOGIN);
                            }
                        } else {
                            //TODO: acá, si dice que es admin, verificarlo con una consulta a la base de datos. Sí, conviene...
                        }

                    } else {

                        ((HttpServletResponse) response).sendRedirect((isProdEnv ? "../../" : "") + this.RESPONSE_REDIRECT_LOGIN);
                    }
                }

            }
        }
        */

        chain.doFilter(request, response);
    }

    public void destroy() {
        //throw new UnsupportedOperationException("Not supported yet.");
    }

    private void showRequestProperties(ServletRequest request, boolean main) {

        System.out.println("--------------------------------------------------------------");

        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        Iterator<Entry<String, String[]>> iterator = null;
        Map.Entry<String, String[]> entry = null;
        String parameterMap = null;

        iterator = httpServletRequest.getParameterMap().entrySet().iterator();
        parameterMap = "";

        while (iterator.hasNext()) {

            entry = iterator.next();

            parameterMap += (parameterMap.length() > 0 ? ", " : "") + "[" + entry.getKey();

            if (entry.getValue() != null && entry.getValue().length > 0) {

                for (int i = 0; i < entry.getValue().length; i++) {

                    if (i == 0) {
                        parameterMap += " -> ";
                    }

                    parameterMap += entry.getValue()[i] + (i == (entry.getValue().length - 1) ? "]" : ", ");

                }
            }
        }

        parameterMap = (parameterMap == "" ? "[]" : parameterMap);

        if (main) {
            System.out.println("getRequestURL().toString() = " + httpServletRequest.getRequestURL().toString());
        } else {
            System.out.println("             getAuthType() = " + httpServletRequest.getAuthType());
            System.out.println("    getCharacterEncoding() = " + httpServletRequest.getCharacterEncoding());
            System.out.println("          getContentType() = " + httpServletRequest.getContentType());
            System.out.println("          getContextPath() = " + httpServletRequest.getContextPath());
            System.out.println("            getLocalAddr() = " + httpServletRequest.getLocalAddr());
            System.out.println("            getLocalName() = " + httpServletRequest.getLocalName());
            System.out.println("            getLocalPort() = " + httpServletRequest.getLocalPort());
            System.out.println("               getMethod() = " + httpServletRequest.getMethod());
            System.out.println("             getPathInfo() = " + httpServletRequest.getPathInfo());
            System.out.println("         getParameterMap() = " + parameterMap);
            System.out.println("       getPathTranslated() = " + httpServletRequest.getPathTranslated());
            System.out.println("             getProtocol() = " + httpServletRequest.getProtocol());
            System.out.println("          getQueryString() = " + httpServletRequest.getQueryString());
            System.out.println("           getRemoteAddr() = " + httpServletRequest.getRemoteAddr());
            System.out.println("           getRemoteHost() = " + httpServletRequest.getRemoteHost());
            System.out.println("           getRemotePort() = " + httpServletRequest.getRemotePort());
            System.out.println("           getRemoteUser() = " + httpServletRequest.getRemoteUser());
            System.out.println("           getRequestURI() = " + httpServletRequest.getRequestURI());
            System.out.println("getRequestURL().toString() = " + httpServletRequest.getRequestURL().toString());
            System.out.println("   getRequestedSessionId() = " + httpServletRequest.getRequestedSessionId());
            System.out.println("               getScheme() = " + httpServletRequest.getScheme());
            System.out.println("           getServerName() = " + httpServletRequest.getServerName());
            System.out.println("           getServerPort() = " + httpServletRequest.getServerPort());
            System.out.println("          getServletPath() = " + httpServletRequest.getServletPath());
        }
    }

    private void inspectRequest(ServletRequest request) {

        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String[] ignoredFileExtensions = new String[]{".css", ".jpg", ".gif", ".png", ".js"};

        for (int i = 0; i < ignoredFileExtensions.length; i++) {
            if (httpServletRequest.getRequestURL().toString().endsWith(ignoredFileExtensions[i].trim())) {
                return;
            }
        }

        StringBuilder builderParametersEnumeration = new StringBuilder();
        Enumeration enumeration = httpServletRequest.getParameterNames();

        String paramName = null;
        String[] paramValues = null;

        while (enumeration.hasMoreElements()) {

            if (builderParametersEnumeration.toString().trim().length() > 0) {
                builderParametersEnumeration.append("; ");
            }

            paramName = (String) enumeration.nextElement();
            paramValues = httpServletRequest.getParameterValues(paramName);
            builderParametersEnumeration.append(paramName);

            if (paramValues != null) {

                for (int i = 0; i < paramValues.length; i++) {

                    if (i > 0) {
                        builderParametersEnumeration.append("|");
                    }
                    if (paramValues[i] != null && !"".equals(paramValues[i].trim())) {
                        builderParametersEnumeration.append("=" + paramValues[i]);
                    }
                }
            }
        }

        Map parameters = httpServletRequest.getParameterMap();
        Iterator iterator = parameters.entrySet().iterator();
        StringBuilder builderParametersMap = new StringBuilder();

        while (iterator.hasNext()) {
            builderParametersMap.append(builderParametersMap.toString().trim().length() > 0 ? "; " : "");
            Entry entry = (Entry) iterator.next();
            builderParametersMap.append(entry.getKey().toString() + (entry.getValue() != null ? " = " + entry.getValue().toString() : ""));
        }

        System.out.println(httpServletRequest.getRequestURL().toString() + (builderParametersEnumeration.toString().length() > 0 ? " [" + builderParametersEnumeration.toString() + "]" : ""));
        //System.out.println(httpServletRequest.getRequestURL().toString() + (builderParametersMap.toString().length() > 0 ? " [" + builderParametersMap.toString() + "]" : ""));

    }
}
