import branchStatistics from "../../assets/admin/branch_statistics.svg";
import branchInfo from "../../assets/admin/branch_info.svg";
import branchAccounts from "../../assets/admin/branch_accounts.svg";
import Title from "../../components/titles/Title";
import CardBox from "../../components/layout/CardBox";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useLocationState from "../../hooks/useLocationState";
import useGoToBack from "../../hooks/useGoToBack";

const boxes = [
  {
    text: "الإحصائيات",
    color: "#7049A3",
    icon: branchStatistics,
    link: "branchStatistics",
  },
  // {
  //   text: "إدارة الحسابات",
  //   color: "#D9A322",
  //   icon: branchAccounts,
  //   link: "BranchAccounts",
  // },
  {
    text: "إدارة معلومات الفرع",
    color: "#E76D3B",
    icon: branchInfo,
    link: "Details",
  },
];

function Branch() {
  const branchInfo = useLocationState("branch");
  const handleClickBack = useGoToBack();
  console.log(branchInfo)
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4 ">
      <Title
        text={`شركة نوجا تيك فرع: ${branchInfo[0]?.city_name} ${branchInfo[0]?.number}`}
      />
      <section className="flex flex-row-reverse flex-wrap items-center justify-center gap-16 w-full py-8 px-4">
        {boxes.map((box) => {
          return (
            <CardBox
              key={box.text}
              icon={box.icon}
              color={box.color}
              text={box.text}
              link={box.link}
              data={branchInfo[0]}
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

export default Branch;
