import { useEffect, useMemo, useState } from "react";
import {
  type Instance,
  css as createCss,
  type CSS,
  useSubscribe,
  toValue,
} from "@webstudio-is/sdk";
import { type StyleUpdates } from "~/shared/component";

type UseCssProps = {
  instance: Instance;
  css: CSS;
};

type UpdatesReset = Array<{
  property: string;
  value: undefined;
}>;

const usePreviewCss = ({ instance, css }: UseCssProps) => {
  const [previewCss, setPreviewCss] = useState<
    StyleUpdates["updates"] | UpdatesReset
  >([]);

  useSubscribe<string, StyleUpdates>(
    `previewStyle:${instance.id}`,
    ({ updates }) => {
      setPreviewCss(updates);
    }
  );

  // We are building a map for unsetting the ephemeral values we previously set for the preview
  useEffect(() => {
    const reset = previewCss.map(({ property }) => ({
      property,
      value: undefined,
    }));
    setPreviewCss(reset);
    // previewCss in deps leads to an infinite loop
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [css]);

  return previewCss;
};

export const useCss = ({ instance, css }: UseCssProps): string => {
  const previewCss = usePreviewCss({ instance, css });

  return useMemo(() => {
    const overrides: CSS = {};
    for (const update of previewCss) {
      if (update.value === undefined) continue;
      overrides[update.property as string] = toValue(update.value);
    }

    return createCss(css)({ css: overrides });
  }, [css, previewCss]);
};
