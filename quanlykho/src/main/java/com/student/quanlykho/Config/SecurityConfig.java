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

                        // 1. AUTHENTICATION (Ai cũng vào được)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. QUẢN LÝ TÀI KHOẢN & HỒ SƠ
                        // 🎯 Cho phép xem danh sách và thống kê (profile-stats) nếu đã đăng nhập
                        .requestMatchers(HttpMethod.GET, "/api/users/*/profile-stats").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        // 🎯 Các thao tác Thêm/Sửa/Xóa tài khoản vẫn giữ cho ADMIN
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        // 3. NHÀ CUNG CẤP
                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasAuthority("ADMIN")

                        // 4. ĐƠN ĐẶT HÀNG (Orders / PO) - Đã mở thêm cho KHO xem
                        .requestMatchers(HttpMethod.GET, "/api/orders/**", "/api/don-hang/**").hasAnyAuthority("ADMIN", "MUAHANG", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasAuthority("ADMIN")

                        // 5. HÀNG HÓA (Products)
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/hang-hoa/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/hang-hoa/**").hasAuthority("ADMIN")

                        // 6. NHẬP KHO
                        .requestMatchers(HttpMethod.GET, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO", "MUAHANG", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")

                        // 7. XUẤT KHO
                        .requestMatchers(HttpMethod.GET, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")

                        // 8. DASHBOARD / BÁO CÁO
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyAuthority("ADMIN", "QUANLYKHO")

                        // 9. YÊU CẦU XUẤT KHO (Lệnh xuất)
                        .requestMatchers(HttpMethod.GET, "/api/yeu-cau-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/yeu-cau-xuat/**").hasAnyAuthority("ADMIN", "QUANLYKHO", "KHO")
                        .requestMatchers(HttpMethod.PUT, "/api/yeu-cau-xuat/*/duyet").hasAnyAuthority("ADMIN", "QUANLYKHO")

                        // 10. YÊU CẦU MUA HÀNG (PR)
                        .requestMatchers(HttpMethod.GET, "/api/yeu-cau-mua/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/yeu-cau-mua/**").hasAnyAuthority("KHO", "QUANLYKHO", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/yeu-cau-mua/*/duyet").hasAnyAuthority("ADMIN", "MUAHANG")

                        // 11. CÁC MODULE KHÁC
                        .requestMatchers("/api/trao-doi/**", "/api/thong-bao/**").authenticated()

                        // --- CHỐT CHẶN ---
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