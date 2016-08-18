package me.lcardito.spring.util;

import com.google.common.net.InternetDomainName;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

public class Utils {
    public static String databaseNameFromJdbcUrl(String url) {
        try {
            URI uri = new URI(url.replace("jdbc:", ""));
            return uri.getPath().substring(1);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public static String getSubDomain(HttpServletRequest req) {
        String subDomain = Constants.INTERNAL_TENANT_IDENTIFIER;

        String site = req.getServerName();
        InternetDomainName domainName = InternetDomainName.from(site);
        if (domainName.isUnderPublicSuffix()) {
            String domain = domainName.topPrivateDomain().toString();
            subDomain = site.replaceAll(domain, "");
            subDomain = subDomain.substring(0, subDomain.length() - 1);
        }

        return subDomain;
    }
}
