import requests
import re
from urllib.parse import urlparse, parse_qs

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def api_get(url, params=None, headers=None):
    params = params or {}
    headers = headers or {}
    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as err:
        print("GET请求出错：", err)
        return None


def api_post(url, json_data=None, headers=None):
    json_data = json_data or {}
    headers = headers or {}
    try:
        res = requests.post(url, json=json_data, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as err:
        print("POST请求出错：", err)
        return None
def get_ip_info(method="GET"):
    url = "https://api.xinyew.cn/api/ip"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        if method.upper() == "GET":
            resp = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            resp = requests.post(url, headers=headers, timeout=10)
        else:
            print("仅支持GET/POST")
            return None

        resp.raise_for_status()
        data = resp.json()

        if data.get("ret") != 0:
            print(f"API返回错误：{data.get('errMsg', '未知错误')}")
            return None

        return {
            "ip": data.get("ip", ""),
            "country": data.get("country", ""),
            "province": data.get("province", ""),
            "city": data.get("city", ""),
            "district": data.get("district", ""),
            "isp": data.get("isp", ""),
            "provcode": data.get("provcode", ""),
            "citycode": data.get("citycode", ""),
            "districtCode": data.get("districtCode", ""),
            "ret": data.get("ret"),
            "errMsg": data.get("errMsg", "")
        }
    except requests.exceptions.RequestException as e:
        print(f"请求失败：{e}")
        return None

def get_vsixmarket(market_url: str, target_version: str = None) -> dict:
    parse_res = urlparse(market_url)
    query_dict = parse_qs(parse_res.query)
    item_name = None

    if "itemName" in query_dict:
        item_name = query_dict["itemName"][0]
    else:
        match_obj = re.search(r"items[=/]([\w\-]+\.[\w\-]+)", market_url)
        if match_obj:
            item_name = match_obj.group(1)

    if not item_name:
        raise ValueError("无法解析URL，请传入合法VS Code插件Marketplace地址")

    fieldA, fieldB = item_name.split(".", maxsplit=1)

    api_url = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
    api_headers = HEADERS.copy()
    api_headers["Accept"] = "application/json;api-version=7.2-preview.1"
    api_headers["Content-Type"] = "application/json"

    api_payload = {
        "filters": [
            {
                "criteria": [
                    {"filterType": 7, "value": item_name}
                ],
                "pageSize": 1,
                "pageNumber": 1,
                "sortBy": 0,
                "sortOrder": 0
            }
        ],
        "assetTypes": [],
        "flags": 103
    }

    resp = requests.post(api_url, json=api_payload, headers=api_headers, timeout=20)
    resp.raise_for_status()
    data = resp.json()

    if not data.get("results") or not data["results"][0].get("extensions"):
        raise RuntimeError("无法获取插件信息")

    extension = data["results"][0]["extensions"][0]
    versions = extension.get("versions", [])

    if not versions:
        raise RuntimeError("未找到插件版本信息")

    latest_version = versions[0]["version"]
    use_ver = target_version if target_version else latest_version

    download_url = (
        f"https://marketplace.visualstudio.com/_apis/public/gallery/"
        f"publishers/{fieldA}/vsextensions/{fieldB}/{use_ver}/vspackage"
    )

    return {
        "itemName": item_name,
        "fieldA": fieldA,
        "fieldB": fieldB,
        "version": use_ver,
        "download_url": download_url
    }
