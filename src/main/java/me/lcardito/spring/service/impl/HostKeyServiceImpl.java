package me.lcardito.spring.service.impl;

import me.lcardito.spring.dao.tenant.HostKeyDao;
import me.lcardito.spring.model.tenant.HostKey;
import me.lcardito.spring.service.HostKeyService;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.apache.sshd.common.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Optional;

@Service
//@Transactional(rollbackFor={DuplicateValueException.class,InternalServiceException.class})
@Transactional(value="tenantTransactionManager")
@Primary
public class HostKeyServiceImpl implements HostKeyService {
    private static final Logger LOGGER = Logger.getLogger(HostKeyServiceImpl.class);
    @Autowired
    private HostKeyDao hostKeyDao;

    public HostKeyServiceImpl() {
        java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
    }

    @Override
    public HostKey getHostKey(String algorithm) {
        HostKey hostKey = null;
        if(algorithm == null)
            algorithm = "RSA";
        Optional<HostKey> dbHostKey = hostKeyDao.findByAlgorithm(algorithm);
        if (!dbHostKey.isPresent()) {
            KeyPair kp = getNewKeyPair(algorithm);
            if (kp != null) {
                hostKey = setHostKeyPair(kp);
            }
        }
        return dbHostKey.orElse(hostKey);
    }

    @Override
    public KeyPair getKeyPair(String algorithm) {
        HostKey hostKey = getHostKey(algorithm);
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(Base64.decodeBase64(hostKey.getPublicKey()));

        // We do not know the algorithm, but we can try and generate keys with the X509 key spec
        try {
            PublicKey publicKey = KeyFactory.getInstance(hostKey.getAlgorithm()).generatePublic(publicKeySpec);
            PrivateKey privateKey = KeyFactory.getInstance(hostKey.getAlgorithm()).generatePrivate(new PKCS8EncodedKeySpec(Base64.decodeBase64(hostKey.getPrivateKey())));
            return new KeyPair(publicKey, privateKey);
        } catch (InvalidKeySpecException | NoSuchAlgorithmException e) {
            LOGGER.error("Error generating host keys.", e);
            return null;
        }
    }

    private HostKey setHostKeyPair(KeyPair keyPair) {
        HostKey dbHostKey = new HostKey();
        dbHostKey.setAlgorithm(keyPair.getPrivate().getAlgorithm());
        dbHostKey.setPublicKey(Base64.encodeBase64String(keyPair.getPublic().getEncoded()));
        dbHostKey.setPrivateKey(Base64.encodeBase64String(keyPair.getPrivate().getEncoded()));
        hostKeyDao.save(dbHostKey);
        return dbHostKey;
    }

    private KeyPair getNewKeyPair(String algorithm) {
        KeyPair kp = null;
        try {
            KeyPairGenerator generator = SecurityUtils.getKeyPairGenerator(algorithm);
            kp = generator.generateKeyPair();
        } catch (NoSuchAlgorithmException | NoSuchProviderException e) {
            LOGGER.error("Cannot generate host key pair for algorithm '" + algorithm + "': " + e.getMessage());
        }
        return kp;
    }

    @Override
    public void setKeys(String publicKey, String privateKey) {
        HostKey hostKey = new HostKey();
        hostKey.setAlgorithm("RSA");
        hostKey.setPublicKey(publicKey);
        hostKey.setPrivateKey(privateKey);
        hostKeyDao.save(hostKey);
    }
}

