export class MDE {
    constructor(logs = null) {
        this.logs = logs;
    }

    // 判断是否保留数据
    shouldKeep(v) {
        if (v === null || v === undefined) return false;
        if (typeof v === 'string' && (v.trim() === '' || v === 'Unknown')) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
        return true;
    }

    // 递归清理数据
    removeNulls(obj) {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.removeNulls(item)).filter((item) => this.shouldKeep(item));
        } else if (obj && typeof obj === 'object') {
            const newObj = {};
            for (let [k, v] of Object.entries(obj)) {
                if (this.shouldKeep(v)) {
                    newObj[k] = this.removeNulls(v);
                }
            }
            return newObj;
        }
        return obj;
    }

    // 去重
    removeDuplicate(listWithDuplicates) {
        const seen = new Set();
        const unique = [];
        for (const item of listWithDuplicates) {
            const serialized = JSON.stringify(item, Object.keys(item).sort());
            if (!seen.has(serialized)) {
                seen.add(serialized);
                unique.push(item);
            }
        }
        return unique;
    }

    // 去掉时区，改成 Z
    removeTimeZone(time) {
        if (!time) return null;
        return time.split('.')[0] + 'Z';
    }

    // 解析 entities
    parseEntities(entities) {
        const e = [];
        for (const entitie of entities) {
            let ee = {};
            if (entitie.entityType === 'File') {
                let filepath = entitie.filePath;
                if (filepath) {
                    try {
                        let decoded = Buffer.from(filepath, 'binary').toString();
                        console.log(`Decoded filePath: ${decoded}`);
                    } catch (err) {
                        console.error(`Error decoding filePath: ${err}`);
                    }
                }
                ee = {
                    fileName: entitie.fileName,
                    filePath: filepath,
                    sha256: entitie.sha256
                };
            } else if (entitie.entityType === 'Process') {
                let process = {
                    processCommandLine: entitie.processCommandLine,
                    accountName: entitie.accountName,
                    domainName: entitie.domainName,
                    userSid: entitie.userSid,
                    userPrincipalName: entitie.userPrincipalName,
                    detectionStatus: entitie.detectionStatus,
                    processCreationTime: this.removeTimeZone(entitie.processCreationTime)
                };
                const validFilenames = [
                    'cmd.exe',
                    'powershell.exe',
                    'powershell_ise.exe',
                    'wscript.exe',
                    'cscript.exe'
                ];
                if (entitie.fileName && !validFilenames.includes(entitie.fileName)) {
                    process.sha256 = entitie.sha256;
                }
                ee = process;
            } else if (entitie.entityType === 'Ip') {
                ee = { ipAddress: entitie.ipAddress };
            } else if (entitie.entityType === 'Domain') {
                ee = { domainName: entitie.domainName };
            } else if (entitie.entityType === 'Registry') {
                ee = {
                    registryKey: entitie.registryKey,
                    registryValueType: entitie.registryValueType,
                    registryValue: entitie.registryValue
                };
            } else if (entitie.entityType === 'User') {
                ee = {
                    accountName: entitie.accountName,
                    domainName: entitie.domainName,
                    userSid: entitie.userSid,
                    userPrincipalName: entitie.userPrincipalName
                };
            } else if (entitie.entityType === 'CloudApplication') {
                ee = { applicationName: entitie.applicationName };
            } else if (entitie.entityType === 'Url') {
                ee = { url: entitie.url };
            }
            e.push(ee);
        }
        return this.removeDuplicate(e);
    }

    // 解析 M365 日志
    parseM365Logs(jsonLog) {
        const logs = {};
        const incidents = jsonLog.incidents;
        logs.incidentName = incidents.incidentName;
        logs.createdTime = this.removeTimeZone(incidents.createdTime);
        logs.incidentUri = incidents.incidentUri.replace('hXXps[:]', 'https:');

        const a = [];
        for (const alert of incidents.alerts) {
            const d = [];
            for (const device of alert.devices) {
                const loggedOnUser_ = [];
                for (const loggedOnUser of device.loggedOnUsers) {
                    loggedOnUser_.push(`${loggedOnUser.accountName}/${loggedOnUser.domainName}`);
                }
                d.push({
                    deviceDnsName: device.deviceDnsName,
                    loggedOnUsers: loggedOnUser_
                });
            }
            const e = this.parseEntities(alert.entities);
            a.push({
                creationTime: this.removeTimeZone(alert.creationTime),
                lastUpdatedTime: this.removeTimeZone(alert.lastUpdatedTime),
                alertId: alert.alertId,
                detectionSource: alert.detectionSource,
                detectorId: alert.detectorId,
                title: alert.title,
                description: alert.description,
                category: alert.category,
                threatFamilyName: alert.threatFamilyName,
                devices: d,
                entities: e
            });
        }
        logs.alerts = a;
        console.log(JSON.stringify(this.removeNulls(logs)));
        return JSON.stringify(this.removeNulls(logs));
    }

    // 解析 MDE 日志
    parseMDELogs(jsonLog) {
        const logs = {};
        const mde = jsonLog.mde;
        logs.link = mde.link.replace('hXXps[:]', 'https:');
        logs.incidentId = mde.incidentId;
        logs.detectionSource = mde.detectionSource;
        logs.category = mde.category;
        logs.threatFamilyName = mde.threatFamilyName;
        logs.title = mde.title;
        logs.description = mde.description;
        logs.computerDnsName = mde.computerDnsName;
        logs.alertCreationTime = this.removeTimeZone(mde.alertCreationTime);
        logs.lastUpdateTime = this.removeTimeZone(mde.lastUpdateTime);
        logs.evidence = this.parseEntities(mde.evidence);

        console.log(JSON.stringify(this.removeNulls(logs)));
        return JSON.stringify(this.removeNulls(logs));
    }

    // 主解析方法
    parseLog() {
        const jsonLog = JSON.parse(this.logs);
        const integration = jsonLog.integration;
        if (integration === 'Wazuh-Microsoft-Threat-Protection') {
            return this.parseM365Logs(jsonLog);
        }
        if (integration === 'Wazuh-MDE') {
            return this.parseMDELogs(jsonLog);
        }
    }
}
// 使用示例

// import fs from 'fs';
// const filePath = 'F:\\PWC-SDC-BlueTeam-Dev\\SOC_Project\\TI\\fastapi-ti\\utils\\mde.json';
// const logs = fs.readFileSync(filePath, 'utf-8');

// const parser = new MDE(logs);
// parser.parseLog();
