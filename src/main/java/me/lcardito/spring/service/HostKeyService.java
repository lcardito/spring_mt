package me.lcardito.spring.service;

import me.lcardito.spring.model.tenant.HostKey;

import java.security.KeyPair;

public interface HostKeyService {
    HostKey getHostKey(String algorithm);
    KeyPair getKeyPair(String algorithm);
    void setKeys(String publicKey, String privateKey);
}
