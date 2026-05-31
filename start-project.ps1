# SJG 数字人文平台 - 一键启动脚本
# 自动寻找 IDEA 中的 Maven 或系统 Maven，并在独立窗口中启动后端与两个前端

Write-Host "==================================================" -ForegroundColor Gold
Write-Host "   SJG 数字人文平台 一键启动服务 (Yellow River)   " -ForegroundColor Gold
Write-Host "==================================================" -ForegroundColor Gold

# 1. 寻找 Maven 路径
$mvnPath = "mvn"
if ($env:MAVEN_HOME) {
    $mvnPath = "$env:MAVEN_HOME\bin\mvn.cmd"
    Write-Host "[系统提示] 找到环境变量 MAVEN_HOME: $env:MAVEN_HOME" -ForegroundColor Green
} else {
    $ideaMaven = "D:\Aohs\app\IntelliJ IDEA 2025.3.1\plugins\maven\lib\maven3\bin\mvn.cmd"
    if (Test-Path $ideaMaven) {
        $mvnPath = $ideaMaven
        $env:MAVEN_HOME = "D:\Aohs\app\IntelliJ IDEA 2025.3.1\plugins\maven\lib\maven3"
        Write-Host "[系统提示] 找到 IntelliJ IDEA 预装 Maven: $env:MAVEN_HOME" -ForegroundColor Green
    } else {
        Write-Host "[系统提示] 未找到 MAVEN_HOME，将尝试使用全局 'mvn' 关键字启动..." -ForegroundColor Yellow
    }
}

# 获取当前工作目录
$currentDir = Get-Location

# 2. 启动 Spring Boot 后端
Write-Host "[1/3] 正在新窗口启动后端 Spring Boot 服务 (端口 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- 启动后端服务 ---' -ForegroundColor Cyan; cd '$currentDir\backend'; & '$mvnPath' spring-boot:run"

# 延迟 3 秒等待后端初始化
Start-Sleep -Seconds 3

# 3. 启动管理端前端 (admin-frontend)
Write-Host "[2/3] 正在新窗口启动管理端前端 (端口 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- 启动管理端前端 ---' -ForegroundColor Cyan; cd '$currentDir\admin-frontend'; npm run dev"

# 4. 启动展示端前端 (display-frontend)
Write-Host "[3/4] 正在新窗口启动原有展示端前端 (端口 5174)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- 启动原有展示端前端 ---' -ForegroundColor Cyan; cd '$currentDir\display-frontend'; npm run dev"

# 5. 启动全新 3D+AI 展示端前端 (display-v2)
Write-Host "[4/4] 正在新窗口启动全新 3D+AI 数字化展示端前端 (端口 5175)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- 启动全新 3D+AI 数字化展示端前端 ---' -ForegroundColor Cyan; cd '$currentDir\display-v2'; npm run dev"

Write-Host "--------------------------------------------------" -ForegroundColor Gold
Write-Host "启动指令已全部发送！请在弹出的窗口中查看实时运行日志。" -ForegroundColor Green
Write-Host "访问入口：" -ForegroundColor Gold
Write-Host "  ✨ [全新 3D+AI 版] 展示端 (免登录)：http://localhost:5175" -ForegroundColor Green
Write-Host "  👉 [原有版本] 展示端 (免登录)      ：http://localhost:5174" -ForegroundColor Green
Write-Host "  👉 管理端 (admin/admin123)        ：http://localhost:5173" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Gold
