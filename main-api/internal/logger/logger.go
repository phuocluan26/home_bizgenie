package logger

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"strings"
	"time"
)

type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

var (
	currentLevel LogLevel = INFO
	logger       *log.Logger
)

func init() {
	logger = log.New(os.Stdout, "", 0)
}

// SetLevel sets the minimum log level
func SetLevel(level LogLevel) {
	currentLevel = level
}

// SetLevelFromString sets the log level from string (debug, info, warn, error)
func SetLevelFromString(level string) {
	switch strings.ToLower(level) {
	case "debug":
		SetLevel(DEBUG)
	case "info":
		SetLevel(INFO)
	case "warn":
		SetLevel(WARN)
	case "error":
		SetLevel(ERROR)
	default:
		SetLevel(INFO)
	}
}

// GetLevel returns the current log level
func GetLevel() LogLevel {
	return currentLevel
}

// getCallerInfo returns file and line number of the caller
func getCallerInfo() string {
	_, file, line, ok := runtime.Caller(3)
	if !ok {
		return "unknown:0"
	}
	// Get only the filename, not the full path
	parts := strings.Split(file, "/")
	filename := parts[len(parts)-1]
	return fmt.Sprintf("%s:%d", filename, line)
}

// formatMessage formats the log message with timestamp, level, and caller info
func formatMessage(level string, msg string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	caller := getCallerInfo()
	return fmt.Sprintf("[%s] [%s] [%s] %s", timestamp, level, caller, msg)
}

// Debug logs a debug message
func Debug(format string, v ...interface{}) {
	if currentLevel <= DEBUG {
		msg := fmt.Sprintf(format, v...)
		logger.Println(formatMessage("DEBUG", msg))
	}
}

// Info logs an info message
func Info(format string, v ...interface{}) {
	if currentLevel <= INFO {
		msg := fmt.Sprintf(format, v...)
		logger.Println(formatMessage("INFO", msg))
	}
}

// Warn logs a warning message
func Warn(format string, v ...interface{}) {
	if currentLevel <= WARN {
		msg := fmt.Sprintf(format, v...)
		logger.Println(formatMessage("WARN", msg))
	}
}

// Error logs an error message
func Error(format string, v ...interface{}) {
	if currentLevel <= ERROR {
		msg := fmt.Sprintf(format, v...)
		logger.Println(formatMessage("ERROR", msg))
	}
}

// ErrorWithErr logs an error message with error details
func ErrorWithErr(msg string, err error) {
	if currentLevel <= ERROR {
		caller := getCallerInfo()
		timestamp := time.Now().Format("2006-01-02 15:04:05")
		logger.Printf("[%s] [ERROR] [%s] %s: %v\n", timestamp, caller, msg, err)
	}
}

// Fatal logs a fatal error and exits
func Fatal(format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	caller := getCallerInfo()
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logger.Fatalf("[%s] [FATAL] [%s] %s\n", timestamp, caller, msg)
}

// FatalWithErr logs a fatal error with error details and exits
func FatalWithErr(msg string, err error) {
	caller := getCallerInfo()
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logger.Fatalf("[%s] [FATAL] [%s] %s: %v\n", timestamp, caller, msg, err)
}
