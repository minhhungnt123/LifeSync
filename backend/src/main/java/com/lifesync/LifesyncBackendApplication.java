package com.lifesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class LifesyncBackendApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(LifesyncBackendApplication.class, args);
	}

	private static void loadDotenv() {
		List<Path> candidatePaths = List.of(Paths.get("../.env"), Paths.get(".env"));
		for (Path path : candidatePaths) {
			if (Files.exists(path)) {
				try {
					List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
					for (String line : lines) {
						String trimmed = line.trim();
						if (trimmed.isEmpty() || trimmed.startsWith("#")) {
							continue;
						}
						int eqIndex = trimmed.indexOf('=');
						if (eqIndex > 0) {
							String key = trimmed.substring(0, eqIndex).trim();
							String value = trimmed.substring(eqIndex + 1).trim();
							if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					break;
				} catch (IOException ignored) {
				}
			}
		}
	}
}
