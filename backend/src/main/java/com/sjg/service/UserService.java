package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.dto.ResetPasswordRequest;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResult<User> list(int page, int size, String keyword, String status) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getUsername, keyword);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getId);
        Page<User> result = userMapper.selectPage(new Page<>(page, size), wrapper);
        result.getRecords().forEach(u -> u.setPassword(null));
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public void approve(Long id) {
        updateStatus(id, "approved");
    }

    public void reject(Long id) {
        updateStatus(id, "rejected");
    }

    public void disable(Long id) {
        updateStatus(id, "disabled");
    }

    public void enable(Long id) {
        updateStatus(id, "approved");
    }

    public void resetPassword(Long id, ResetPasswordRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }

    private void updateStatus(Long id, String status) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setStatus(status);
        userMapper.updateById(user);
    }
}
