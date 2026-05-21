package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.ChangePasswordRequest;
import com.sjg.dto.LoginRequest;
import com.sjg.dto.LoginResponse;
import com.sjg.dto.RegisterRequest;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest request) {
        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        user.setStatus("pending");
        userMapper.insert(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        if ("pending".equals(user.getStatus())) {
            throw new RuntimeException("账号待审批，请等待管理员审核");
        }
        if ("rejected".equals(user.getStatus())) {
            throw new RuntimeException("注册已被拒绝");
        }
        if ("disabled".equals(user.getStatus())) {
            throw new RuntimeException("账号已被禁用");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, user.getUsername());
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("当前密码错误");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }
}
