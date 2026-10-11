package com.sjg.service;

import com.aliyun.oss.OSS;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UploadSecurityTest {
    private OssService service() {
        OssService service = new OssService();
        ReflectionTestUtils.setField(service, "ossClient", mock(OSS.class));
        return service;
    }
    @Test void svgIsRejected() {
        assertThrows(Exception.class, () -> service().upload(new MockMultipartFile("file", "evil.svg", "image/svg+xml", "<svg/>".getBytes()), "images"));
    }
    @Test void declaredPngWithHtmlBytesIsRejected() {
        assertThrows(Exception.class, () -> service().upload(new MockMultipartFile("file", "evil.png", "image/png", "<script>evil</script>".getBytes()), "images"));
    }
    @Test void traversalDirectoryIsRejected() {
        assertThrows(Exception.class, () -> service().upload(new MockMultipartFile("file", "photo.png", "image/png", new byte[]{(byte)137,80,78,71,13,10,26,10}), "../private"));
    }
    @Test void explicitCredentialSdkConstructionWorksWithoutTheVulnerableIniParser() {
        OSS client = new com.aliyun.oss.OSSClientBuilder().build("https://oss-cn-beijing.aliyuncs.com", "test-only-id", "test-only-secret");
        assertNotNull(client);
        client.shutdown();
    }
}
