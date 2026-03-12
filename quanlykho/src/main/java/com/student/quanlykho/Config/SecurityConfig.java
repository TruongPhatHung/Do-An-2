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
        http.cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Mở cửa cho phép đăng nhập, đăng ký không cần token
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                        // Trong file SecurityConfig.java, sửa dòng này:
                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasAuthority("ADMIN")

                        // TẤT CẢ các API khác (kho, users, nhà cung cấp) ĐỀU PHẢI CÓ TOKEN
                        .anyRequest().authenticated()
                )
                // GẮN CÁI KHIÊN JWT VÀO ĐÂY!
                .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

}
