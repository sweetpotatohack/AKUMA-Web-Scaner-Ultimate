#!/bin/bash

# Исправляем функцию check_tools в script_scaner.sh
sed -i '/^check_tools() {/,/^}/c\
check_tools() {\
    local missing_tools=()\
    local required_tools=("nmap" "httpx" "nuclei" "whatweb" "wpscan" "gobuster" "nikto" "curl" "python3")\
    \
    log "🔧 Checking required tools..."\
    \
    # Проверяем основные инструменты\
    for tool in "${required_tools[@]}"; do\
        if ! command -v "$tool" &>/dev/null; then\
            # Специальная проверка для httpx\
            if [[ "$tool" == "httpx" ]] && command -v "httpx-toolkit" &>/dev/null; then\
                # httpx установлен как httpx-toolkit, создаем симлинк\
                ln -sf /usr/bin/httpx-toolkit /usr/local/bin/httpx\
                continue\
            fi\
            missing_tools+=("$tool")\
        fi\
    done\
    \
    # Проверяем специальные инструменты\
    if [ ! -f "/root/cloud_enum/cloud_enum.py" ]; then\
        missing_tools+=("cloud_enum")\
    fi\
    \
    if [ ! -d "/root/nuclei-templates-bitrix" ]; then\
        missing_tools+=("bitrix_templates")\
    fi\
    \
    if [ ! -f "/root/check_bitrix/test_bitrix.py" ]; then\
        missing_tools+=("check_bitrix")\
    fi\
    \
    if [ ! -f "/opt/testssl.sh/testssl.sh" ]; then\
        missing_tools+=("testssl")\
    fi\
    \
    if ! command -v "waybackurls" &>/dev/null; then\
        missing_tools+=("waybackurls")\
    fi\
    \
    if ! command -v "jaeles" &>/dev/null; then\
        missing_tools+=("jaeles")\
    fi\
    \
    # Если есть отсутствующие инструменты - устанавливаем\
    if [ ${#missing_tools[@]} -gt 0 ]; then\
        log "⚠️ Missing tools: ${missing_tools[*]}"\
        log "🔧 Installing missing tools..."\
        \
        # Запускаем скрипт установки\
        if [ -f "./install_tools.sh" ]; then\
            bash ./install_tools.sh\
        else\
            log "❌ install_tools.sh not found!"\
            return 1\
        fi\
        \
        # Устанавливаем Go инструменты если Go доступен\
        if command -v go &>/dev/null; then\
            export GOPATH="/root/go"\
            export PATH="$PATH:/root/go/bin"\
            \
            for tool in "${missing_tools[@]}"; do\
                case "$tool" in\
                    "waybackurls")\
                        go install github.com/tomnomnom/waybackurls@latest\
                        ;;\
                    "jaeles")\
                        go install github.com/jaeles-project/jaeles@latest\
                        ;;\
                esac\
            done\
        fi\
        \
        # Устанавливаем специальные инструменты\
        for tool in "${missing_tools[@]}"; do\
            case "$tool" in\
                "cloud_enum")\
                    if [ ! -f "/root/cloud_enum/cloud_enum.py" ]; then\
                        git clone https://github.com/initstring/cloud_enum.git /root/cloud_enum\
                        pip3 install -r /root/cloud_enum/requirements.txt --break-system-packages\
                    fi\
                    ;;\
                "bitrix_templates")\
                    if [ ! -d "/root/nuclei-templates-bitrix" ]; then\
                        git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix\
                    fi\
                    ;;\
                "check_bitrix")\
                    if [ ! -f "/root/check_bitrix/test_bitrix.py" ]; then\
                        git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix\
                        pip3 install -r /root/check_bitrix/requirements.txt --break-system-packages\
                    fi\
                    ;;\
                "testssl")\
                    if [ ! -f "/opt/testssl.sh/testssl.sh" ]; then\
                        git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh\
                        chmod +x /opt/testssl.sh/testssl.sh\
                        ln -sf /opt/testssl.sh/testssl.sh /usr/local/bin/testssl\
                    fi\
                    ;;\
            esac\
        done\
    fi\
    \
    # Проверяем, что все критически важные инструменты установлены\
    local critical_missing=()\
    for tool in "nmap" "curl" "python3"; do\
        if ! command -v "$tool" &>/dev/null; then\
            critical_missing+=("$tool")\
        fi\
    done\
    \
    if [ ${#critical_missing[@]} -gt 0 ]; then\
        log "❌ Critical tools missing: ${critical_missing[*]}"\
        return 1\
    fi\
    \
    log "✅ Tool check completed"\
    return 0\
}' script_scaner.sh

