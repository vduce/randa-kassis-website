import SectionTitle from "../SectionTitle/SectionTitle";

import img1 from "../../images/books/1.jpg";
import img2 from "../../images/books/2.jpg";
import img3 from "../../images/books/4.jpg";
import img4 from "../../images/books/5.jpg";
import img5 from "../../images/books/3.jpg";

const handleLink = (link) => {
  // Open the URL in a new tab
  window.open(link, "_blank");
};

const BookSection = () => {
  const products = [
    {
      id: 1,
      proImg: img1,
      title: "رندا قسيس سراديب الآلهة",
      slug: "رندا قسيس سراديب الآلهة",
      price: "176.00",
      delPrice: "178.00",
      brand: "Gucci",
      size: "M",
      link: "http://randakassis.eu/ar/wp-content/uploads/2016/07/%D8%B3%D8%B1%D8%A7%D8%AF%D9%8A%D8%A8-%D8%A7%D9%84%D8%A7%D9%84%D9%87%D8%A9.pdf",
    },
    {
      id: 2,
      proImg: img2,
      title: "COMPRENDRE LE CHAOS SYRIEN",
      slug: "COMPRENDRE-LE-CHAOS-SYRIEN",
      price: "65.00",
      delPrice: "85.00",
      brand: "Gucci",
      size: "XXl",
      link: "https://www.editionsartilleur.fr/produit/chaos-syrien-del-valle-kassis/",
    },
    {
      id: 3,
      proImg: img3,
      title: "LE CHAOS SYRIEN",
      slug: "LE-CHAOS-SYRIEN",
      price: "285.00",
      delPrice: "300.00",
      brand: "Gucci",
      size: "L",
      link: "https://www.amazon.fr/Syrien-printemps-arabes-minorit%C3%A9s-lislamisme/dp/B00N4OE92Y",
    },
    {
      id: 4,
      proImg: img4,
      title: "crypts of the gods",
      slug: "crypts-of-the-gods",
      price: "340.00",
      delPrice: "380.00",
      brand: "Gucci",
      size: "Xl",
      link: "https://www.amazon.fr/Crypts-Gods-Randa-Kassis/dp/1492880604",
    },
    {
      id: 5,
      proImg: img5,
      title: "Syria and the Return of Russia",
      slug: "syria-and-the-return-of-russia",
      price: "340.00",
      delPrice: "380.00",
      brand: "Gucci",
      size: "Xl",
      link: "https://www.amazon.fr/Syrie-retour-Russie-Randa-Kassis/dp/2940523630",
    },
  ];
  
  return (
    <section className="wpo-shop-section  section-padding1">
      <div className="container">
        <SectionTitle subTitle={"Books"} Title={"Show All Books"} />

        <div className="row">
          <div className="col col-xs-12">
            <div className="shop-grids clearfix">
              {products.length > 0 &&
                products.slice(0, 12).map((product, pitem) => (
                  <div
                    onClick={() => handleLink(product.link)} // Pass the product link to handleLink
                    className="grid"
                    key={pitem}
                  >
                    <div className="img-holder">
                      <img src={product.proImg} alt={product.title} />
                    </div>
                    <div className="details">
                      <h3>{product.title}</h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;
