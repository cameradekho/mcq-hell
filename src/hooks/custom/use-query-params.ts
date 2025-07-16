import { useRouter, useSearchParams } from "next/navigation";

import { buildQueryString } from "@/lib/build-query-string";

type TAction = "push" | "replace";

export const useQueryParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params: { [key: string]: string } = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const updateParam = (
    filterKey: string,
    value: string | undefined,
    action: TAction = "push"
  ) => {
    const updatedParams = { ...params, [filterKey]: value };
    const qs = buildQueryString(updatedParams);

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    }
  };

  const updateParams = (
    newParams: { [key: string]: string | undefined },
    action: TAction = "push"
  ) => {
    const updatedParams = { ...params, ...newParams };
    const qs = buildQueryString(updatedParams);

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    }
  };

  const removeParam = (filterKey: string, action: TAction = "push") => {
    const updatedParams = { ...params, [filterKey]: undefined };
    const qs = buildQueryString(updatedParams);

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    }
  };

  const removeAllParams = (
    excludeKeys: string[] = [],
    action: TAction = "push"
  ) => {
    const updatedParams: { [key: string]: string | undefined } = {};

    if (excludeKeys.length > 0) {
      excludeKeys.forEach((key) => {
        if (params[key] !== undefined) {
          updatedParams[key] = params[key];
        }
      });
    }

    const qs = buildQueryString(updatedParams);

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    }
  };

  return { params, updateParam, updateParams, removeParam, removeAllParams };
};
