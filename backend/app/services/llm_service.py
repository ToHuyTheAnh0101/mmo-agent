from typing import AsyncGenerator
import httpx
import json


async def stream_chat_completion(
    base_url: str,
    api_key: str,
    model: str,
    messages: list[dict],
    max_tokens: int = 4096,
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:
    """Stream chat completion from an OpenAI-compatible API.
    
    Yields delta content tokens as they arrive.
    """
    url = f"{base_url.rstrip('/')}/chat/completions"
    
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, json=payload, headers=headers) as response:
            if response.status_code != 200:
                body = await response.aread()
                try:
                    error_data = json.loads(body)
                    error_msg = error_data.get("error", {}).get("message", f"LLM API error: {response.status_code}")
                except (json.JSONDecodeError, KeyError):
                    error_msg = f"LLM API error: {response.status_code}"
                raise Exception(error_msg)

            async for line in response.aiter_lines():
                line = line.strip()
                if not line:
                    continue
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        parsed = json.loads(data)
                        delta = parsed.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
