package com.student.quanlykho.Config;

import com.student.quanlykho.Security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http ) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // 1. ĐĂNG NHẬP & XÁC THỰC (Mở toang)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. ADMIN: QUẢN LÝ TÀI KHOẢN & LOGS (Giữ nguyên độ gắt)
                        // Bất kỳ ai sửa, xóa user đều bị chém đầu nếu không phải ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/users/*/profile-stats").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/logs/**").hasAuthority("ADMIN")

                        // 3. TẤT CẢ CÁC API NGHIỆP VỤ KHÁC (Hàng hóa, PO, Nhập/Xuất, Chat...)
                        // 🎯 Cho phép TẤT CẢ nhân viên ĐÃ ĐĂNG NHẬP được gọi (Phân quyền chi tiết giao cho Frontend lo)
                        .requestMatchers("/api/suppliers/**").authenticated()
                        .requestMatchers("/api/orders/**", "/api/don-hang/**").authenticated()
                        .requestMatchers("/api/products/**", "/api/hang-hoa/**").authenticated()
                        .requestMatchers("/api/phieu-nhap/**").authenticated()
                        .requestMatchers("/api/phieu-xuat/**").authenticated()
                        .requestMatchers("/api/yeu-cau-xuat/**").authenticated()
                        .requestMatchers("/api/yeu-cau-mua/**").authenticated()
                        .requestMatchers("/api/trao-doi/**", "/api/thong-bao/**").authenticated()
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // --- CHỐT CHẶN BẢO MẬT CUỐI CÙNG ---
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}