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
  const Books = [
    {
      id: 1,
      proImg: img1,
      title: "رندا قسيس سراديب الآلهة",
      price: "176.00",
      delPrice: "178.00",
      brand: "Gucci",
      size: "M",
      link: "http://randakassis.eu/ar/wp-content/uploads/2016/07/%D8%B3%D8%B1%D8%A7%D8%AF%D9%8A%D8%A8-%D8%A7%D9%84%D8%A7%D9%84%D9%87%D8%A9.pdf",
    },
    {
      id: 2,
      proImg: img2,
      title: "Comprendre le chaos syrien",
      price: "65.00",
      delPrice: "85.00",
      brand: "Gucci",
      size: "XXl",
      link: "https://www.editionsartilleur.fr/produit/chaos-syrien-del-valle-kassis/",
    },
    {
      id: 3,
      proImg: img3,
      title: "Le chaos syrien",
      price: "285.00",
      delPrice: "300.00",
      brand: "Gucci",
      size: "L",
      link: "https://www.amazon.fr/Syrien-printemps-arabes-minorit%C3%A9s-lislamisme/dp/B00N4OE92Y",
    },
    {
      id: 4,
      proImg: img4,
      title: "Crypts of the Gods",
      price: "340.00",
      delPrice: "380.00",
      brand: "Gucci",
      size: "Xl",
      link: "https://www.amazon.fr/Crypts-Gods-Randa-Kassis/dp/1492880604",
    },
    {
      id: 5,
      proImg: img5,
      title: "La Syrie et le retour de la Syrie",
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
            <div className="shop-grids clearfix book-section-grids">
              {Books.length > 0 &&
                Books.slice(0, 12).map((book, pitem) => (
                  <div
                    onClick={() => handleLink(book.link)} // Pass the book link to handleLink
                    className="grid"
                    key={pitem}
                  >
                    <div className="img-holder">
                      <img src={book.proImg} alt={book.title} />
                    </div>
                    <div className="details">
                      <h4>{book.title}</h4>
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
