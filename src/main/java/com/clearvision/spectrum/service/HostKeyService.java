package com.clearvision.spectrum.service;

import com.clearvision.spectrum.model.tenant.HostKey;

import java.security.KeyPair;

public interface HostKeyService {
    HostKey getHostKey(String algorithm);
    KeyPair getKeyPair(String algorithm);
    void setKeys(String publicKey, String privateKey);
}
