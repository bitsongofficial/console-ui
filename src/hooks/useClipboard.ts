import { copyToClipboard, useQuasar } from 'quasar';

export const useClipboard = () => {
    const quasar = useQuasar()
  const onCopy = async (link: string) => {
    try {
      await copyToClipboard(link);
      quasar.notify({
        message: `copied`,
        color: "positive",
        icon: "warning",
        closeBtn: true,
        timeout: 10000,
    })
    } catch (error) {
      console.error(error);
      quasar.notify({
        message: `error`,
        color: "negative",
        icon: "warning",
        closeBtn: true,
        timeout: 10000,
    })
    }
  };

  return { onCopy };
}