package com.clearvision.spectrum.confighelper;

import com.clearvision.spectrum.util.Constants;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * TenantIdentifierInterceptorAdapter.
 *
 * @author Zakir Magdum
 */
@Component
public class TenantIdentifierInterceptorAdapter extends HandlerInterceptorAdapter {
//    @Inject
//    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        //TODO:
//        if (req.getUserPrincipal() != null) {
//            Optional<User> user = userRepository.findOneByName(req.getUserPrincipal().getName());
//            if (user.isPresent()) {
//                // Set the company key as tenant identifier
//                req.setAttribute(Constants.CURRENT_TENANT_IDENTIFIER, user.get().getCompany().getCompanyKey());
//            }
//        }
        req.setAttribute(Constants.CURRENT_TENANT_IDENTIFIER, "INTERNAL");
        return true;
    }
}
