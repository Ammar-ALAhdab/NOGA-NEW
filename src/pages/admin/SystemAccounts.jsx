import CardBox from "../../components/layout/CardBox";
import Title from "../../components/titles/Title";
import admin from "../../assets/admin/admin.svg";
import warehouse from "../../assets/admin/warehouse.svg";
import hr from "../../assets/admin/hr.svg";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";

const boxes = [
  {
    text: "Admin",
    color: "#7049A3",
    icon: admin,
    link: "AdminAccount",
  },
  {
    text: "Warehouse administrator",
    color: "#D9A322",
    icon: warehouse,
    link: "WarehouseAccount",
  },
  {
    text: "HR",
    color: "#E76D3B",
    icon: hr,
    link: "HrAccount",
  },
];

function SystemAccounts() {
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
        <div className="w-full flex justify-end items-center">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
        </div>
      </section>
    </main>
  );
}

export default SystemAccounts;
