import csv
import random


def generate_test_csv(filename="test_students_50.csv"):
    emails = [f"student_{i}@example.com" for i in range(1, 51)]
    with open(filename, mode="w", newline="") as file:
        writer = csv.DictWriter(
            file, fieldnames=["email", "gpa", "enrolled_credits", "failed_classes"]
        )
        writer.writeheader()
        for email in emails:
            writer.writerow(
                {
                    "email": email,
                    "gpa": round(random.uniform(50.0, 100.0), 2),
                    "enrolled_credits": random.randint(20, 45),
                    "failed_classes": random.randint(0, 5),
                }
            )
    print(f"Generated {filename}")


if __name__ == "__main__":
    generate_test_csv()
