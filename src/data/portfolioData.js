import restaurantImg from '../images/Restaurant Project.png';
import invoiceNImg from '../images/Invoice N.png';
import invoicePImg from '../images/Invoice P.png';
import invoiceSImg from '../images/Invoice S.png';

export const portfolioData = {
    hero: {
        name: "Tirth Dangodra",
        role: "Full Stack Developer",
        description: "I build tailored, accessible, and high-performance digital experiences for the web. Let's craft something amazing together.",
        image: "https://github.com/tirthdangodra10.png",
        resumeLink: "#resume",
        resumeUrl: "", // New field for PDF data/link
        email: "tirthdangodra@gmail.com",
        phone: "7283997622",
        socials: {
            linkedin: "https://www.linkedin.com/in/tirth-dangodra-607402372/",
            github: "https://github.com/tirthdangodra10",
        }
    },
    contact: {
        title: "Get In Touch",
        subtitle: "Let's talk about everything!",
        description: "If you have any questions or want to get in touch, feel free to reach out!",
        email: "tirthdangodra@gmail.com",
        phone: "7283997622",
        socials: {
            linkedin: "https://www.linkedin.com/in/tirth-dangodra-607402372/",
            github: "https://github.com/tirthdangodra10",
        }
    },
    projects: [
        {
            title: "Restaurant Website",
            description: "A modern Restaurant Website built using HTML, CSS, and JavaScript that showcases menus, chef specials, customer reviews, and contact information. The site features a clean, responsive design optimized for mobile and desktop viewing, intuitive navigation, and visually appealing UI to provide users with a delightful browsing experience.",
            tags: ["HTML", "CSS", "JS"],
            link: "https://github.com/tirthdangodra10/Restaurant-Website",
            image: restaurantImg
        },
        {
            title: "Invoice Generator - .NET",
            description: "A desktop or web-based Invoice Generator application developed using .NET technologies that enables users to create professional invoices with customer details, itemized billing, automatic calculations, and export options (such as PDF).",
            tags: ["C#", "ASP.NET", "PDF"],
            link: "https://github.com/tirthdangodra10/Invoice-Generator---.NET",
            image: invoiceNImg
        },
        {
            title: "Invoice Generator - Python",
            description: "A practical Invoice Generator application built using Python that enables users to create customized invoices quickly and efficiently. The program allows users to input client details, itemized services, prices, and tax calculations, then generates well-formatted invoices.",
            tags: ["Python", "Tkinter", "PDF"],
            link: "https://github.com/tirthdangodra10/Invoice-Generator---Python-",
            image: invoicePImg
        },
        {
            title: "Invoice Generator Software",
            description: "A practical and user-friendly Invoice Generator application developed using Python that helps users quickly generate professional invoices. The tool allows input of client information, itemized charges, quantity, pricing, and automatically calculates totals including taxes.",
            tags: ["HTML", "CSS", "JS", "PDF"],
            link: "https://github.com/tirthdangodra10/Invoice-Generator",
            image: invoiceSImg
        }
    ]
};
