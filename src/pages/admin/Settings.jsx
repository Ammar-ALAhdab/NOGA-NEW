import CardBox from "../../components/layout/CardBox";
import Title from "../../components/titles/Title";
import settings from "../../assets/admin/settings.svg";
import settings_accounts from "../../assets/admin/settings_accounts.svg";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";

const boxes = [
  {
    text: "إدارة حسابات النظام",
    color: "#7049A3",
    icon: settings_accounts,
    link: "SystemAccounts",
  },
  {
    text: "إعدادات النظام",
    color: "#D9A322",
    icon: settings,
    link: "SystemSettings",
  },
];

function Settings() {
  const handleClickBack = useGoToBack();
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`الإعدادات:`} />
      <section className="flex flex-row-reverse flex-wrap items-center justify-center gap-16 w-full py-8 px-4">
        {boxes.map((box) => {
          return (
            <CardBox
              key={box.text}
              icon={box.icon}
              color={box.color}
              text={box.text}
              link={box.link}
            />
          );
        })}
      </section>
      <div className="w-full flex justify-end items-center">
        <ButtonComponent variant={"back"} onClick={handleClickBack} />
      </div>
    </main>
  );
}

export default Settings;
