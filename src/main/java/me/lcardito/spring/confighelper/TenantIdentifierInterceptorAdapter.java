package me.lcardito.spring.confighelper;

import me.lcardito.spring.repository.master.CompanyRepository;
import me.lcardito.spring.util.Constants;
import me.lcardito.spring.util.Utils;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class TenantIdentifierInterceptorAdapter extends HandlerInterceptorAdapter {

    @Inject
    private CompanyRepository companyRepository;

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        String companyKey = Utils.getSubDomain(req);
        if (companyRepository.findOneByCompanyKey(companyKey).isPresent()) {
            req.setAttribute(Constants.CURRENT_TENANT_IDENTIFIER, companyKey);
        } else {
            req.setAttribute(Constants.CURRENT_TENANT_IDENTIFIER, Constants.UNKNOWN_TENANT);
        }

        return true;
    }
}
