-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: aug. 30, 2023 la 02:31 PM
-- Versiune server: 10.4.28-MariaDB
-- Versiune PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Bază de date: `alkadb`
--

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `conveyorwh`
--

CREATE TABLE `conveyorwh` (
  `id` int(11) NOT NULL,
  `value` varchar(10) DEFAULT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `conveyorwh`
--

INSERT INTO `conveyorwh` (`id`, `value`, `data`) VALUES
(60, '1', '2023-08-30 10:07:06'),
(61, '1', '2023-08-30 10:07:10');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `error_logs`
--

CREATE TABLE `error_logs` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` smallint(6) DEFAULT NULL CHECK (`status` in (0,1)),
  `error_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `duration` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `error_logs`
--

INSERT INTO `error_logs` (`id`, `type`, `description`, `status`, `error_date`, `duration`) VALUES
(1, 'Error Type 1', 'Description of Error 9', 0, '2023-08-25 11:49:30', '00:01:09'),
(2, 'Error Type 2', 'Description of Error 9', 0, '2023-08-25 11:49:30', '00:01:09'),
(3, 'Error Type 3', 'Description of Error 9', 0, '2023-08-25 11:49:30', '00:01:09'),
(4, 'Error Type 9', 'Description of Error 9', 0, '2023-08-25 11:58:46', '00:00:53'),
(5, 'Error Type 9', 'Description of Error 9', 0, '2023-08-27 17:23:52', '00:00:21'),
(6, 'Error Type 9', 'Description of Error 9', 0, '2023-08-27 18:18:35', '04:39:15'),
(7, 'Error Type 9', 'Description of Error 9', 0, '2023-08-28 08:56:35', '00:12:08'),
(8, 'Error Type 9', 'Description of Error 9', 0, '2023-08-28 12:14:15', '00:00:14'),
(9, 'Error Type 9', 'Description of Error 9', 0, '2023-08-28 12:59:48', '00:29:10'),
(10, 'Error Type 9', 'Description of Error 9', 0, '2023-08-28 14:21:38', '00:00:07'),
(11, 'Error Type 9', 'Description of Error 9', 0, '2023-08-28 14:21:54', '00:01:36'),
(12, 'Error Type 9', 'Description of Error 9', 0, '2023-08-29 10:11:03', '00:00:00'),
(13, 'Error Type 9', 'Description of Error 9', 0, '2023-08-29 11:11:11', '00:00:00');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`) VALUES
(3, 'smarius672@gmail.com', '$2b$10$jXP.uD/5.O0LfT4R1qoL8O/BM1Z6kZXqwq6s.DlyEm.g2lPq0sTIm'),
(8, 'albert.stoian@dasstec.ro', '$2b$10$98uq9TiDmwbuyBaC8h0qo.uklx4uCszkDXCdP6SGSto6syYdwAFWq'),
(13, 'lamisto@sss.com', '$2b$10$rrvum5ooUNfvcg0zjwq4ZOqwBAkUDOGQyf4Eyj0W4IFvKb4OkYE8a'),
(15, 'smarius672@gmai', '$2b$10$0vChTh0G67peUFkBK4GkMeOhvNJ2YXofofheBRhKAoOX.GQnYqj32'),
(17, 'marius_mihalcea_99@yahoo.ro', '$2b$10$2uSeo9/Be8tpsC6s7oL4Mumjh6QB7OXly6YImRHHjm.1c6iN6gMly');

--
-- Indexuri pentru tabele eliminate
--

--
-- Indexuri pentru tabele `conveyorwh`
--
ALTER TABLE `conveyorwh`
  ADD PRIMARY KEY (`id`);

--
-- Indexuri pentru tabele `error_logs`
--
ALTER TABLE `error_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexuri pentru tabele `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pentru tabele eliminate
--

--
-- AUTO_INCREMENT pentru tabele `conveyorwh`
--
ALTER TABLE `conveyorwh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT pentru tabele `error_logs`
--
ALTER TABLE `error_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pentru tabele `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
