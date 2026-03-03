import { toast } from "react-toastify";

export const configApi = (contentTypeJson: boolean = true) => {
  const localToken = localStorage.getItem("appToken");
  const token = localToken ? localToken : "";
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentTypeJson ? 'application/json':'multipart/form-data'
    }
  }
}

export const resolveResponse = (response: any) => {
  if(response.status >= 200 && response.status < 300) {
    toast.success(response.message, {
      theme: 'colored'
    });
    return;
  };

  if(response.status >= 400 && response.status < 500) {
    if(response.status === 401) {
      toast.warn("Sessão finalizada!", {
        theme: 'colored'
      });

      setTimeout(() => {
        window.location.href = "/aplicativo";
        localStorage.clear();
      }, 1000);
      return;
    }

    toast.warn(response?.response?.data?.result?.message, {
      theme: 'colored'
    });
    return;
  };

  toast.error(response?.response?.data?.message, {
    theme: 'colored'
  });
};

export const resolveParamsRequest = (params: any) => {
  if(params == undefined && params == null) return '';

  let _params = ``;
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'boolean') {
      _params += `&${key}=${value}`;
    } else {
      if (value) _params += `&${key}=${value}`;
    }
  }

  return _params;
}

export const isTokenExpiringSoon = (thresholdDays: number = 2): boolean | null => {
    const raw = localStorage.getItem("token");
    if (!raw) return null;

    try {
        const payload = JSON.parse(atob(raw.split(".")[1]));
        if (!payload?.exp) return null;

        const expiresAt  = payload.exp * 1000;              
        const now        = Date.now();
        const threshold  = thresholdDays * 24 * 60 * 60 * 1000;

        return (expiresAt - now) <= threshold;              
    } catch {
        return null;                                        
    }
};