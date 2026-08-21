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

    private static final int MIN_PASSWORD_LENGTH = 6;
    private static final int MAX_PASSWORD_LENGTH = 100;

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 用户注册：校验用户名唯一性 + 密码强度
     */
    public void register(RegisterRequest request) {
        // 校验用户名
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (request.getUsername().length() < 3 || request.getUsername().length() > 50) {
            throw new RuntimeException("用户名长度应在3-50个字符之间");
        }

        // 校验密码强度
        validatePassword(request.getPassword());

        // 检查用户名唯一性
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

    /**
     * 用户登录：校验用户名密码 + 账号状态
     */
    public LoginResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("请输入用户名");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("请输入密码");
        }

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
        return new LoginResponse(token, user.getUsername(), user.getRole());
    }

    /**
     * 修改密码：校验旧密码 + 新密码强度
     */
    public void changePassword(String username, ChangePasswordRequest request) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("用户未登录");
        }

        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
            throw new RuntimeException("请输入当前密码");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("当前密码错误");
        }

        // 校验新密码强度
        validatePassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }

    /**
     * 校验密码强度
     */
    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new RuntimeException("密码不能为空");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new RuntimeException("密码长度不能少于" + MIN_PASSWORD_LENGTH + "个字符");
        }
        if (password.length() > MAX_PASSWORD_LENGTH) {
            throw new RuntimeException("密码长度不能超过" + MAX_PASSWORD_LENGTH + "个字符");
        }
        // 可选：检查密码复杂度（至少包含字母和数字）
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasLetter || !hasDigit) {
            throw new RuntimeException("密码必须包含字母和数字");
        }
    }
}
